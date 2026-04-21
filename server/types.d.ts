declare global {
  namespace Express {
    interface Request {
      token?: string;
      tokenData?: any;
      twin?: any;
    }
  }
}

export {};
