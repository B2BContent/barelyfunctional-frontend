import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision'
import schemas from './schemas';

export default defineConfig({
  name: 'default',
  title: 'Barely Functional CMS',
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemas },
});
