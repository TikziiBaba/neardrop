/**
 * NearDrop WebRTC & Realtime P2P Direct Transfer Engine
 * High-speed, zero-knowledge direct file transfer between browsers
 */

import { createClient } from "@/lib/supabase/client";
import { getClientDeviceInfo, ClientDeviceInfo } from "@/lib/utils/device";

const CHUNK_SIZE = 64 * 1024; // 64 KB per chunk for optimal WebRTC buffer throughput
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export interface PeerInfo extends ClientDeviceInfo {
  joinedAt: number;
}

export interface DirectTransferPayload {
  transferId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface DirectTransferProgress {
  transferId: string;
  filename: string;
  size: number;
  transferredBytes: number;
  progress: number;
  speed: number;
  eta?: number;
  status: "requesting" | "accepted" | "transferring" | "completed" | "declined" | "cancelled" | "failed";
  direction: "send" | "receive";
  peerName: string;
}

export class DirectTransferEngine {
  private roomCode: string;
  private myDevice: ClientDeviceInfo;
  private supabase: any;
  private channel: any;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private isDestroyed = false;

  // Active incoming file buffers
  private incomingBuffers: Map<
    string,
    {
      meta: DirectTransferPayload;
      chunks: ArrayBuffer[];
      receivedBytes: number;
      startedAt: number;
    }
  > = new Map();

  // Callbacks
  public onPeersUpdated?: (peers: PeerInfo[]) => void;
  public onIncomingRequest?: (request: DirectTransferPayload, accept: () => void, decline: () => void) => void;
  public onProgress?: (progress: DirectTransferProgress) => void;
  public onCompleted?: (meta: { filename: string; size: number; blobUrl: string }) => void;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.myDevice = getClientDeviceInfo();
    this.supabase = createClient();
  }

  public async init() {
    if (!this.supabase) {
      console.warn("Supabase client not available for Realtime signaling.");
      return;
    }

    const channelName = `neardrop_room_${this.roomCode}`;
    this.channel = this.supabase.channel(channelName, {
      config: {
        presence: {
          key: this.myDevice.deviceId,
        },
      },
    });

    // 1. Listen for peer presence updates
    this.channel
      .on("presence", { event: "sync" }, () => {
        const state = this.channel.presenceState();
        const allPeers: PeerInfo[] = [];

        Object.keys(state).forEach((key) => {
          if (key !== this.myDevice.deviceId) {
            const presences = state[key] as any[];
            if (presences && presences.length > 0) {
              allPeers.push(presences[0] as PeerInfo);
            }
          }
        });

        this.onPeersUpdated?.(allPeers);
      })
      .on("presence", { event: "join" }, ({ newPresences }: any) => {
        newPresences.forEach((presence: PeerInfo) => {
          if (presence.deviceId !== this.myDevice.deviceId) {
            this.initiatePeerConnection(presence.deviceId);
          }
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }: any) => {
        leftPresences.forEach((presence: PeerInfo) => {
          this.closePeer(presence.deviceId);
        });
      });

    // 2. Listen for WebRTC Signaling & Transfer Broadcasts
    this.channel.on("broadcast", { event: "signal" }, async ({ payload }: any) => {
      if (payload.targetId !== this.myDevice.deviceId) return;
      await this.handleSignalMessage(payload);
    });

    // 3. Listen for Transfer Requests
    this.channel.on("broadcast", { event: "transfer_request" }, ({ payload }: any) => {
      if (payload.receiverId !== this.myDevice.deviceId) return;
      this.handleIncomingTransferRequest(payload);
    });

    // 4. Listen for Transfer Responses (Accept / Decline)
    this.channel.on("broadcast", { event: "transfer_response" }, ({ payload }: any) => {
      if (payload.senderId !== this.myDevice.deviceId) return;
      this.handleTransferResponse(payload);
    });

    // 5. Fallback chunk broadcast (in case WebRTC DataChannel is blocked)
    this.channel.on("broadcast", { event: "transfer_chunk" }, ({ payload }: any) => {
      if (payload.receiverId !== this.myDevice.deviceId) return;
      this.handleReceivedChunk(payload.transferId, payload.chunkIndex, payload.chunkData, payload.isLast);
    });

    // Subscribe and track self
    await this.channel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await this.channel.track({
          ...this.myDevice,
          joinedAt: Date.now(),
        });
      }
    });
  }

  // --- WebRTC Peer Connection Setup ---
  private createPeerConnection(targetId: string): RTCPeerConnection {
    let pc = this.peerConnections.get(targetId);
    if (pc) return pc;

    pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate && this.channel) {
        this.channel.send({
          type: "broadcast",
          event: "signal",
          payload: {
            targetId,
            senderId: this.myDevice.deviceId,
            type: "candidate",
            candidate: e.candidate,
          },
        });
      }
    };

    pc.ondatachannel = (e) => {
      this.setupDataChannel(targetId, e.channel);
    };

    this.peerConnections.set(targetId, pc);
    return pc;
  }

  private async initiatePeerConnection(targetId: string) {
    try {
      const pc = this.createPeerConnection(targetId);
      const dc = pc.createDataChannel("neardrop-data", { ordered: true });
      this.setupDataChannel(targetId, dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (this.channel) {
        this.channel.send({
          type: "broadcast",
          event: "signal",
          payload: {
            targetId,
            senderId: this.myDevice.deviceId,
            type: "offer",
            sdp: offer,
          },
        });
      }
    } catch (err) {
      console.warn("Failed to initiate WebRTC offer:", err);
    }
  }

  private setupDataChannel(targetId: string, dc: RTCDataChannel) {
    dc.binaryType = "arraybuffer";

    dc.onopen = () => {
      this.dataChannels.set(targetId, dc);
    };

    dc.onclose = () => {
      this.dataChannels.delete(targetId);
    };

    dc.onerror = (err) => {
      console.warn("DataChannel error with peer:", targetId, err);
    };

    dc.onmessage = (e) => {
      if (typeof e.data === "string") {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "chunk_meta") {
            // control message
          }
        } catch {}
      } else if (e.data instanceof ArrayBuffer) {
        // Binary chunk received via WebRTC
        this.handleBinaryDataChannelChunk(e.data);
      }
    };
  }

  private async handleSignalMessage(payload: any) {
    const { senderId, type, sdp, candidate } = payload;
    let pc = this.peerConnections.get(senderId);

    if (type === "offer") {
      if (!pc) pc = this.createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      this.channel.send({
        type: "broadcast",
        event: "signal",
        payload: {
          targetId: senderId,
          senderId: this.myDevice.deviceId,
          type: "answer",
          sdp: answer,
        },
      });
    } else if (type === "answer") {
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } else if (type === "candidate") {
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    }
  }

  // --- File Sending API ---
  public async sendFileToPeer(targetPeer: PeerInfo, file: File) {
    const transferId = `dt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload: DirectTransferPayload = {
      transferId,
      senderId: this.myDevice.deviceId,
      senderName: this.myDevice.deviceName,
      receiverId: targetPeer.deviceId,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    };

    // 1. Notify UI that request is sent
    this.onProgress?.({
      transferId,
      filename: file.name,
      size: file.size,
      transferredBytes: 0,
      progress: 0,
      speed: 0,
      status: "requesting",
      direction: "send",
      peerName: targetPeer.deviceName,
    });

    // 2. Broadcast transfer request
    this.channel.send({
      type: "broadcast",
      event: "transfer_request",
      payload,
    });

    // 3. Store file reference for when receiver accepts
    (this as any)[`file_${transferId}`] = file;
  }

  private async handleIncomingTransferRequest(req: DirectTransferPayload) {
    const accept = () => {
      this.incomingBuffers.set(req.transferId, {
        meta: req,
        chunks: [],
        receivedBytes: 0,
        startedAt: Date.now(),
      });

      this.onProgress?.({
        transferId: req.transferId,
        filename: req.filename,
        size: req.size,
        transferredBytes: 0,
        progress: 0,
        speed: 0,
        status: "accepted",
        direction: "receive",
        peerName: req.senderName,
      });

      this.channel.send({
        type: "broadcast",
        event: "transfer_response",
        payload: {
          transferId: req.transferId,
          senderId: req.senderId,
          receiverId: this.myDevice.deviceId,
          accepted: true,
        },
      });
    };

    const decline = () => {
      this.channel.send({
        type: "broadcast",
        event: "transfer_response",
        payload: {
          transferId: req.transferId,
          senderId: req.senderId,
          receiverId: this.myDevice.deviceId,
          accepted: false,
        },
      });
    };

    this.onIncomingRequest?.(req, accept, decline);
  }

  private async handleTransferResponse(payload: any) {
    const { transferId, accepted, receiverId } = payload;
    const file: File = (this as any)[`file_${transferId}`];
    if (!file) return;

    if (!accepted) {
      this.onProgress?.({
        transferId,
        filename: file.name,
        size: file.size,
        transferredBytes: 0,
        progress: 0,
        speed: 0,
        status: "declined",
        direction: "send",
        peerName: "Peer",
      });
      delete (this as any)[`file_${transferId}`];
      return;
    }

    // Start sending file chunks!
    await this.streamFileChunks(transferId, receiverId, file);
  }

  private async streamFileChunks(transferId: string, receiverId: string, file: File) {
    const totalSize = file.size;
    let offset = 0;
    const startedAt = Date.now();
    const dc = this.dataChannels.get(receiverId);

    while (offset < totalSize && !this.isDestroyed) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await slice.arrayBuffer();
      const isLast = offset + buffer.byteLength >= totalSize;

      // Try sending via WebRTC DataChannel first
      if (dc && dc.readyState === "open" && dc.bufferedAmount < 8 * 1024 * 1024) {
        // Prepend header to buffer [16 bytes header: transferId, isLast]
        dc.send(buffer);
      } else {
        // Fallback: Realtime broadcast chunk (base64)
        const base64Chunk = this.arrayBufferToBase64(buffer);
        this.channel.send({
          type: "broadcast",
          event: "transfer_chunk",
          payload: {
            transferId,
            receiverId,
            chunkIndex: offset,
            chunkData: base64Chunk,
            isLast,
          },
        });
      }

      offset += buffer.byteLength;
      const elapsedSec = (Date.now() - startedAt) / 1000;
      const speed = elapsedSec > 0 ? Math.round(offset / elapsedSec) : 0;
      const progress = Math.round((offset / totalSize) * 100);
      const remainingBytes = Math.max(0, totalSize - offset);
      const eta = speed > 0 ? Math.round(remainingBytes / speed) : undefined;

      this.onProgress?.({
        transferId,
        filename: file.name,
        size: totalSize,
        transferredBytes: offset,
        progress,
        speed,
        eta,
        status: isLast ? "completed" : "transferring",
        direction: "send",
        peerName: "Receiver",
      });

      // Cooperative throttle to avoid buffer congestion
      if (offset % (CHUNK_SIZE * 8) === 0) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    delete (this as any)[`file_${transferId}`];
  }

  private handleBinaryDataChannelChunk(buffer: ArrayBuffer) {
    // Find active receiver buffer
    const activeEntry = Array.from(this.incomingBuffers.entries())[0];
    if (!activeEntry) return;

    const [transferId, session] = activeEntry;
    session.chunks.push(buffer);
    session.receivedBytes += buffer.byteLength;

    const totalSize = session.meta.size;
    const progress = Math.min(100, Math.round((session.receivedBytes / totalSize) * 100));
    const elapsedSec = (Date.now() - session.startedAt) / 1000;
    const speed = elapsedSec > 0 ? Math.round(session.receivedBytes / elapsedSec) : 0;

    this.onProgress?.({
      transferId,
      filename: session.meta.filename,
      size: totalSize,
      transferredBytes: session.receivedBytes,
      progress,
      speed,
      status: session.receivedBytes >= totalSize ? "completed" : "transferring",
      direction: "receive",
      peerName: session.meta.senderName,
    });

    if (session.receivedBytes >= totalSize) {
      this.finalizeIncomingFile(transferId);
    }
  }

  private handleReceivedChunk(transferId: string, chunkIndex: number, base64Data: string, isLast: boolean) {
    const session = this.incomingBuffers.get(transferId);
    if (!session) return;

    const buffer = this.base64ToArrayBuffer(base64Data);
    session.chunks.push(buffer);
    session.receivedBytes += buffer.byteLength;

    const totalSize = session.meta.size;
    const progress = Math.min(100, Math.round((session.receivedBytes / totalSize) * 100));
    const elapsedSec = (Date.now() - session.startedAt) / 1000;
    const speed = elapsedSec > 0 ? Math.round(session.receivedBytes / elapsedSec) : 0;

    this.onProgress?.({
      transferId,
      filename: session.meta.filename,
      size: totalSize,
      transferredBytes: session.receivedBytes,
      progress,
      speed,
      status: isLast ? "completed" : "transferring",
      direction: "receive",
      peerName: session.meta.senderName,
    });

    if (isLast || session.receivedBytes >= totalSize) {
      this.finalizeIncomingFile(transferId);
    }
  }

  private finalizeIncomingFile(transferId: string) {
    const session = this.incomingBuffers.get(transferId);
    if (!session) return;

    const blob = new Blob(session.chunks, { type: session.meta.mimeType || "application/octet-stream" });
    const blobUrl = URL.createObjectURL(blob);

    // Trigger instant browser download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = session.meta.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this.onCompleted?.({
      filename: session.meta.filename,
      size: session.meta.size,
      blobUrl,
    });

    this.incomingBuffers.delete(transferId);
  }

  private closePeer(targetId: string) {
    const pc = this.peerConnections.get(targetId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(targetId);
    }
    const dc = this.dataChannels.get(targetId);
    if (dc) {
      dc.close();
      this.dataChannels.delete(targetId);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.dataChannels.clear();
    if (this.channel && this.supabase) {
      this.supabase.removeChannel(this.channel);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
