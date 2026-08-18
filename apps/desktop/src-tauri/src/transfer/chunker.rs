use crate::networking::protocol::DEFAULT_CHUNK_SIZE;
use std::fs::File;
use std::io::{self, Read, Seek, SeekFrom};
use std::path::Path;

pub struct FileChunker;

impl FileChunker {
    /// Reads a chunk from a file at the specified offset
    pub fn read_chunk<P: AsRef<Path>>(
        path: P,
        offset: u64,
        chunk_size: usize,
    ) -> io::Result<(Vec<u8>, usize, bool)> {
        let mut file = File::open(path)?;
        file.seek(SeekFrom::Start(offset))?;

        let mut buffer = vec![0u8; chunk_size.min(DEFAULT_CHUNK_SIZE)];
        let bytes_read = file.read(&mut buffer)?;
        buffer.truncate(bytes_read);

        let is_eof = bytes_read == 0 || bytes_read < chunk_size;
        Ok((buffer, bytes_read, is_eof))
    }
}
