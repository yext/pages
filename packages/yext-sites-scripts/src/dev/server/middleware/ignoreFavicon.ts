export const ignoreFavicon = (req: any, res: any, next: any): void => {
    if (req.originalUrl.includes('favicon')) {
      res.status(204).end();
      return;
    }
    next();
  }