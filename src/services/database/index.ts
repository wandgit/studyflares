import { DatabaseService } from './base';
import { DocumentService } from './documents';
import { StudyMaterialsService } from './studyMaterials';
import { ExamService } from './exams';
import { StatisticsService } from './statistics';
import { ActivityService } from './activities';

// Export all services
export {
  DatabaseService,
  DocumentService,
  StudyMaterialsService,
  ExamService,
  StatisticsService,
  ActivityService
};

// Create singleton instances
export const documentService = new DocumentService();
export const studyMaterialsService = new StudyMaterialsService();
export const examService = new ExamService();
export const statisticsService = new StatisticsService();
export const activityService = new ActivityService();
