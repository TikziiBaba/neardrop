use std::path::{Component, Path, PathBuf};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum PathSanitizeError {
    #[error("Path traversal detected: {0}")]
    PathTraversal(String),
    #[error("Empty filename")]
    EmptyFilename,
    #[error("Invalid character in path component: {0}")]
    InvalidCharacter(String),
    #[error("Target path is outside base download directory")]
    OutsideBaseDirectory,
}

pub struct PathSanitizer;

impl PathSanitizer {
    /// Sanitizes an incoming relative file path and safely joins it with the base download folder.
    /// Ensures that:
    /// 1. No `..` (ParentDir) components are allowed.
    /// 2. No absolute paths (RootDir, Prefix) are used.
    /// 3. Special reserved Windows filenames (CON, PRN, AUX, NUL, COM1-9, LPT1-9) are sanitized.
    /// 4. Path remains strictly inside the target directory.
    pub fn sanitize_and_resolve(base_dir: &Path, relative_path: &str) -> Result<PathBuf, PathSanitizeError> {
        let trimmed = relative_path.trim().replace('\\', "/");
        if trimmed.is_empty() {
            return Err(PathSanitizeError::EmptyFilename);
        }

        let input_path = Path::new(&trimmed);
        let mut clean_components = Vec::new();

        for comp in input_path.components() {
            match comp {
                Component::Normal(c) => {
                    let s = c.to_string_lossy();
                    if s == ".." || s == "." {
                        return Err(PathSanitizeError::PathTraversal(s.into_owned()));
                    }
                    // Validate Windows reserved device names
                    let upper = s.to_uppercase();
                    let root_name = upper.split('.').next().unwrap_or("");
                    if matches!(
                        root_name,
                        "CON" | "PRN" | "AUX" | "NUL" | "COM1" | "COM2" | "COM3" | "COM4" | "COM5" | "COM6" | "COM7" | "COM8" | "COM9" | "LPT1" | "LPT2" | "LPT3" | "LPT4" | "LPT5" | "LPT6" | "LPT7" | "LPT8" | "LPT9"
                    ) {
                        clean_components.push(format!("_{}", s));
                    } else {
                        // Strip invalid characters: < > : " / \ | ? *
                        let sanitized_component: String = s
                            .chars()
                            .map(|ch| match ch {
                                '<' | '>' | ':' | '"' | '|' | '?' | '*' => '_',
                                _ => ch,
                            })
                            .collect();
                        clean_components.push(sanitized_component);
                    }
                }
                Component::ParentDir => {
                    return Err(PathSanitizeError::PathTraversal("Parent directory '..' not allowed".into()));
                }
                Component::RootDir | Component::Prefix(_) => {
                    // Ignore leading absolute roots, treat as relative
                    continue;
                }
                Component::CurDir => continue,
            }
        }

        if clean_components.is_empty() {
            return Err(PathSanitizeError::EmptyFilename);
        }

        let mut final_path = base_dir.to_path_buf();
        for seg in clean_components {
            final_path.push(seg);
        }

        // Canonical verification if base directory exists
        if base_dir.exists() {
            if let Ok(canon_base) = base_dir.canonicalize() {
                // If the target or parent exists, canonicalize and verify prefix
                if let Some(parent) = final_path.parent() {
                    if parent.exists() {
                        if let Ok(canon_parent) = parent.canonicalize() {
                            if !canon_parent.starts_with(&canon_base) {
                                return Err(PathSanitizeError::OutsideBaseDirectory);
                            }
                        }
                    }
                }
            }
        }

        Ok(final_path)
    }

    /// Extract clean filename only
    pub fn clean_filename(raw_name: &str) -> String {
        let p = Path::new(raw_name);
        p.file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| "unnamed_file".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_path_traversal_rejection() {
        let base = PathBuf::from("C:/NearDrop/Downloads");
        assert!(PathSanitizer::sanitize_and_resolve(&base, "../../windows/system32/cmd.exe").is_err());
        assert!(PathSanitizer::sanitize_and_resolve(&base, "foo/../../bar").is_err());
        assert!(PathSanitizer::sanitize_and_resolve(&base, "..\\..\\evil.sh").is_err());
    }

    #[test]
    fn test_valid_nested_paths() {
        let base = PathBuf::from("C:/NearDrop/Downloads");
        let res = PathSanitizer::sanitize_and_resolve(&base, "my_project/src/main.rs").unwrap();
        assert_eq!(res, PathBuf::from("C:/NearDrop/Downloads/my_project/src/main.rs"));
    }

    #[test]
    fn test_reserved_windows_names() {
        let base = PathBuf::from("C:/NearDrop/Downloads");
        let res = PathSanitizer::sanitize_and_resolve(&base, "CON.txt").unwrap();
        assert_eq!(res, PathBuf::from("C:/NearDrop/Downloads/_CON.txt"));
    }
}
