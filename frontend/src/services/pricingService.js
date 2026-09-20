import { productService } from './productService';

export const pricingService = {
  getActivePlans: productService.getActivePlans,
  getPlanById: productService.getPlanById,
  getPlanBySlug: productService.getPlanBySlug,
};

export default pricingService;
