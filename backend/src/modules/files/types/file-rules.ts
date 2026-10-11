import { FILE_TYPES } from '../constants/file-rules.constants.js';

export type FileTypeRule = (typeof FILE_TYPES)[number];
