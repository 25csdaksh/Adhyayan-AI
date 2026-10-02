/**
 * Standardized API Response structure
 */
class ApiResponse {
  /**
   * Send a successful JSON response
   * @param {import('express').Response} res
   * @param {*} data
   * @param {string} [message='Success']
   * @param {number} [statusCode=200]
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send a paginated successful response
   * @param {import('express').Response} res
   * @param {Array} items
   * @param {object} pagination
   * @param {string} [message='Success']
   */
  static paginated(res, items = [], pagination = {}, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || items.length,
        totalItems: pagination.totalItems || items.length,
        totalPages: pagination.totalPages || 1,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = ApiResponse;
