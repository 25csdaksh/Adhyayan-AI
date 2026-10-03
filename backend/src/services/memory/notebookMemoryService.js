const NotebookMemory = require('../../models/NotebookMemory');
const Notebook = require('../../models/Notebook');
const ApiError = require('../../utils/apiError');

/**
 * Get or initialize notebook memory
 */
async function getNotebookMemory({ notebookId, userId }) {
  const notebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });
  if (!notebook) {
    throw ApiError.notFound('Notebook not found or access denied.');
  }

  let memory = await NotebookMemory.findOne({ notebookId, userId });
  if (!memory) {
    memory = await NotebookMemory.create({
      notebookId,
      userId,
      purpose: '',
      studyGoal: '',
      preferredStyle: 'standard',
      customInstructions: '',
      researchDirection: '',
      active: true,
    });
  }

  return memory;
}

/**
 * Update notebook memory configuration
 */
async function updateNotebookMemory({ notebookId, userId, updateData }) {
  const notebook = await Notebook.findOne({ _id: notebookId, ownerId: userId });
  if (!notebook) {
    throw ApiError.notFound('Notebook not found or access denied.');
  }

  let memory = await NotebookMemory.findOne({ notebookId, userId });
  if (!memory) {
    memory = new NotebookMemory({ notebookId, userId });
  }

  const allowedFields = ['purpose', 'studyGoal', 'preferredStyle', 'customInstructions', 'researchDirection', 'active'];
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      memory[field] = updateData[field];
    }
  }

  await memory.save();
  return memory;
}

module.exports = {
  getNotebookMemory,
  updateNotebookMemory,
};
