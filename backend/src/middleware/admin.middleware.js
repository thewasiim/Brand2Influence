import { allowRoles } from './role.middleware.js'
export const requireAdmin = allowRoles('admin')
