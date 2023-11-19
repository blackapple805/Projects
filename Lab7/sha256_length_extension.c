/* sha256_length_extension.c */

#include <stdio.h>
#include <arpa/inet.h>
#include <string.h> // Include string.h for strlen
#include <openssl/sha.h>

int main (int argc, const char *argv[])
{
  SHA256_CTX c;
  unsigned char buffer[SHA256_DIGEST_LENGTH];
  int i;

  SHA256_Init(&c);

  // Update the context with the secret key and the message
  SHA256_Update(&c, "mySecretKey", strlen("mySecretKey"));
  SHA256_Update(&c, "Give Alice and Bob a raise.", strlen("Give Alice and Bob a raise."));

  // fill in the intermediate hash value
  c.h[0] = htole32(0x3d848679);
  c.h[1] = htole32(0x9a77de57);
  c.h[2] = htole32(0x24de2b24);
  c.h[3] = htole32(0xd50d6a24);
  c.h[4] = htole32(0xa7d112d5);
  c.h[5] = htole32(0x8d18c5a5);
  c.h[6] = htole32(0xb6f1295d);
  c.h[7] = htole32(0xbc1481f4);

  // Append the additional message and update the hash
  SHA256_Update(&c, " Give Darth a raise also.", strlen(" Give Darth a raise also."));
  SHA256_Final(buffer, &c);

  // Print the final hash
  for (i=0;i<32;i++) {
    printf("%02x", buffer[i]);
  }
  printf("\n");
  return 0;
}
