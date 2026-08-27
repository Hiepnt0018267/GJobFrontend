export type Job = {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
}

export type Category = {
  id: string
  name: string
  icon: string
  jobCount: number
}

export type Company = {
  id: string
  name: string
  location: string
  jobCount: number
  initial: string
}
