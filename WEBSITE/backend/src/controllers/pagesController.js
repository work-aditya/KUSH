const Page = require('../models/Page');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Get published CMS page by slug
 */
const getPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug: slug.toLowerCase().trim(), published: true });

    if (!page) {
      return sendError(res, 'PAGE_NOT_FOUND', 'Page not found', 404);
    }

    return sendSuccess(res, {
      title: page.title,
      slug: page.slug,
      content: page.content,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPageBySlug,
};
