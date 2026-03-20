import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/authMiddleware';
import * as docModel from '../models/documentModel';
import { extractTextAsync } from '../services/documentService';

const ALLOWED_MIME_TYPES = [
  'text/plain', 'text/csv', 'text/markdown',
  'application/pdf', 'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});
const router = Router();

router.use(requireAuth);

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { originalname, mimetype, size, buffer } = req.file;
  const title = req.body.title || originalname;
  let tags: string[] = [];
  try { tags = req.body.tags ? JSON.parse(req.body.tags) : []; } catch { /* ignore malformed tags */ }

  try {
    const content = await extractTextAsync(buffer, mimetype);
    const doc = docModel.createDocument(req.user!.userId, title, originalname, mimetype, content, tags, size);
    res.json({ data: { ...doc, content: doc.content.slice(0, 200) + '...' } });
  } catch (err: any) {
    console.error('[Document upload error]', err);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// List documents
router.get('/', (req, res) => {
  const { tag, search } = req.query;
  const docs = docModel.getDocuments(req.user!.userId, tag as string, search as string);
  // Don't send full content in list view
  const lite = docs.map(d => ({ ...d, content: d.content.slice(0, 200) + '...' }));
  res.json({ data: lite });
});

// Search documents (all users — for agent/chat context)
router.get('/search', (req, res) => {
  const q = req.query.q as string;
  if (!q) return res.status(400).json({ error: 'Query required' });
  const docs = docModel.searchDocuments(q, 10);
  const lite = docs.map(d => ({ ...d, content: d.content.slice(0, 300) + '...' }));
  res.json({ data: lite });
});

// Get all tags
router.get('/tags', (req, res) => {
  const tags = docModel.getAllTags(req.user!.userId);
  res.json({ data: tags });
});

// Get single document (ownership check)
router.get('/:id', (req, res) => {
  const doc = docModel.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  // Ensure user can only access their own documents
  if ((doc as any).user_id && (doc as any).user_id !== req.user!.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json({ data: doc });
});

// Update document
router.put('/:id', (req, res) => {
  const { title, tags } = req.body;
  docModel.updateDocument(req.params.id, req.user!.userId, title, tags);
  res.json({ message: 'Updated' });
});

// Delete document
router.delete('/:id', (req, res) => {
  docModel.deleteDocument(req.params.id, req.user!.userId);
  res.json({ message: 'Deleted' });
});

export default router;
