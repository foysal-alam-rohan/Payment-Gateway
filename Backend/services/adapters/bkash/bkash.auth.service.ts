import axios from "axios";

import appError from "../../../utils/appError.ts";

declare const process: {
  env: {
    BKASH_BASE_URL    ?: string;
    BKASH_USERNAME    ?: string;
    BKASH_PASSWORD    ?: string;
    BKASH_APP_KEY     ?: string;
    BKASH_APP_SECRET  ?: string;
  };
};

interface BkashGrantTokenResponse {
  expires_in    : string;
  id_token      : string;
  refresh_token : string;
  token_type    : string;
  statusCode    : string;
  statusMessage : string;
}

class BkashAuth {

  private token       : string | null = null;
  private tokenExpiry : number | null = null;

  public async grantToken(): Promise<string> {
    
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.token;
    }

    const baseURL   = `${process.env.BKASH_BASE_URL}/tokenized/checkout/token/grant`;
    
    const username  = process.env.BKASH_USERNAME;
    const password  = process.env.BKASH_PASSWORD;
    const appKey    = process.env.BKASH_APP_KEY;
    const appSecret = process.env.BKASH_APP_SECRET;

    if (!baseURL || !username || !password || !appKey || !appSecret) {
      throw new appError("Missing bKash configuration. Please check environment variables.", 400);
    }

    try {
      const { data } = await axios.post<BkashGrantTokenResponse>(
        baseURL,
        {
          app_key     : appKey,
          app_secret  : appSecret,
        },
        {
          headers: {
            "Content-Type"  : "application/json",
            Accept          : "application/json",
            username,
            password,
          },
        }
      );

      this.token       = data.id_token;
      this.tokenExpiry = Date.now() + parseInt(data.expires_in) * 1000;

      return data.id_token;
      
    } catch (error: any) {
      console.error("bKash token error:", error.response?.data || error.message);
      throw new appError(
        error.response?.data?.statusMessage || "Failed to grant bKash token.", 500);
    }
  
  }
  
}

export default new BkashAuth();