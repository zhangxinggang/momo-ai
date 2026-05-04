/** Diffie-Hellman 密钥对（PKCS 格式 PEM） */
export interface IDiffieHellmanKeys {
  public_pkcs8: string;
  private_pkcs1: string;
}
