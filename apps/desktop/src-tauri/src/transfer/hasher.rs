use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

pub struct StreamHasher;

impl StreamHasher {
    /// Computes the SHA-256 hash of a file on disk in 64KB streamed chunks
    pub fn compute_file_sha256<P: AsRef<Path>>(path: P) -> io::Result<String> {
        let mut file = File::open(path)?;
        let mut hasher = Sha256::new();
        let mut buffer = [0u8; 64 * 1024];

        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            hasher.update(&buffer[..bytes_read]);
        }

        let result = hasher.finalize();
        Ok(format!("{:x}", result))
    }

    /// Creates an incremental running hasher for incoming chunks
    pub fn new_incremental() -> IncrementalHasher {
        IncrementalHasher {
            hasher: Sha256::new(),
        }
    }
}

pub struct IncrementalHasher {
    hasher: Sha256,
}

impl IncrementalHasher {
    pub fn update(&mut self, data: &[u8]) {
        self.hasher.update(data);
    }

    pub fn finalize(self) -> String {
        let result = self.hasher.finalize();
        format!("{:x}", result)
    }
}
