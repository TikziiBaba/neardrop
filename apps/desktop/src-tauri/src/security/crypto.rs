use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use rand::{rngs::OsRng, RngCore};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Encryption failed: {0}")]
    EncryptionFailed(String),
    #[error("Decryption failed: {0}")]
    DecryptionFailed(String),
    #[error("Invalid key length (must be 32 bytes)")]
    InvalidKeyLength,
}

pub struct SessionCrypto {
    cipher: Aes256Gcm,
}

impl SessionCrypto {
    /// Creates a new AES-256-GCM cipher instance from a 32-byte key
    pub fn new(key: &[u8; 32]) -> Self {
        let cipher = Aes256Gcm::new_from_slice(key).expect("32 bytes is valid for Aes256Gcm");
        SessionCrypto { cipher }
    }

    /// Encrypts plaintext and returns (nonce: 12 bytes + ciphertext + tag)
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, CryptoError> {
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = self
            .cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;

        let mut result = Vec::with_capacity(12 + ciphertext.len());
        result.extend_from_slice(&nonce_bytes);
        result.extend_from_slice(&ciphertext);
        Ok(result)
    }

    /// Decrypts payload that starts with a 12-byte nonce followed by ciphertext + tag
    pub fn decrypt(&self, payload: &[u8]) -> Result<Vec<u8>, CryptoError> {
        if payload.len() < 12 {
            return Err(CryptoError::DecryptionFailed("Payload too short for nonce".into()));
        }

        let (nonce_bytes, ciphertext) = payload.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);

        let plaintext = self
            .cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;

        Ok(plaintext)
    }
}
