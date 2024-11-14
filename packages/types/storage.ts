export type UploadResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      url: string;
    };

export type DeleteResponse =
  | {
      success: false;
      message: string;
      response?: object;
    }
  | {
      success: true;
    };
