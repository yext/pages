/**
 * Redirect urls with a final slash to their canonical url without the slash.
 */
export const finalSlashRedirect = (req: any, res: any, next: any): void => {
  if (req.path.endsWith("/") && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
    res.redirect(301, safepath + query);
  } else {
    next();
  }
};
