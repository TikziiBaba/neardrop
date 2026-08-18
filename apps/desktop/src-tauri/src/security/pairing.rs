use qrcode::render::svg;
use qrcode::QrCode;
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingPayload {
    pub device_id: String,
    pub device_name: String,
    pub public_key: String,
    pub pin: String,
    pub expires_at: i64,
}

pub struct PairingManager;

impl PairingManager {
    /// Generates a 6-digit PIN and QR code SVG valid for 5 minutes
    pub fn generate_pairing_session(
        device_id: &str,
        device_name: &str,
        public_key: &str,
    ) -> (PairingPayload, String) {
        let mut rng = rand::thread_rng();
        let pin: u32 = rng.gen_range(100_000..999_999);
        let pin_str = format!("{:06}", pin);
        let expires_at = chrono::Utc::now().timestamp() + 300; // 5 minutes

        let payload = PairingPayload {
            device_id: device_id.to_string(),
            device_name: device_name.to_string(),
            public_key: public_key.to_string(),
            pin: pin_str,
            expires_at,
        };

        let json_payload = serde_json::to_string(&payload).unwrap_or_default();
        let qr_svg = match QrCode::new(json_payload.as_bytes()) {
            Ok(code) => code
                .render::<svg::Color>()
                .min_dimensions(240, 240)
                .dark_color(svg::Color("#000000"))
                .light_color(svg::Color("#ffffff"))
                .build(),
            Err(_) => String::new(),
        };

        (payload, qr_svg)
    }

    /// Verifies if a PIN or payload is still valid and matches
    pub fn verify_pin(session: &PairingPayload, submitted_pin: &str) -> bool {
        if chrono::Utc::now().timestamp() > session.expires_at {
            return false;
        }
        session.pin.trim() == submitted_pin.trim()
    }
}
