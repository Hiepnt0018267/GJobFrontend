import api from './api'
import type { JobApplication, SubmitApplicationRequest } from '../types/application'

const jobApplicationsPath = (jobId: string) => `/api/v1/jobs/${jobId}/applications`

export const applicationService = {
  async submitApplication(jobId: string, payload: SubmitApplicationRequest): Promise<JobApplication> {
    return (await api.post<JobApplication>(jobApplicationsPath(jobId), payload)).data
  },
}
