/* rsa_keygen.c */
#include <stdio.h>
#include <openssl/bn.h>

#define NBITS 256

void printBN(char *msg, BIGNUM * a)
{
   /* Use BN_bn2hex(a) for hex string
    * Use BN_bn2dec(a) for decimal string */
char * number_str = BN_bn2hex(a);
   printf("%s %s\n", msg, number_str);
   OPENSSL_free(number_str);
}

int main ()

{
  BN_CTX *ctx = BN_CTX_new();
  BIGNUM *p, *q, *n, *phi, *e, *d, *m, *c, *res;
  BIGNUM *new_m, *p_minus_one, *q_minus_one;
   p = BN_new();
  q = BN_new();
  n = BN_new();
  phi = BN_new();
   e = BN_new();
  d = BN_new();
  m = BN_new();
   c = BN_new();
  res = BN_new();
  new_m = BN_new();
   p_minus_one= BN_new();
  q_minus_one = BN_new();

 // set the public key e
BN_dec2bn(&e, "65537");

// generate random p and q
BN_generate_prime_ex(p, NBITS, 1, NULL, NULL, NULL);
BN_generate_prime_ex(q, NBITS, 1, NULL, NULL, NULL);
BN_sub(p_minus_one, p, BN_value_one());//computer p-1
BN_sub(q_minus_one, q, BN_value_one());//computer q-1
BN_mul(n, p, q, ctx);//Compute n=pq
BN_mul(phi, p_minus_one, q_minus_one, ctx);//Compute phi(n)

//check whether e and phi(n) are relatively prime
BN_gcd(res, phi, e, ctx);
if(!BN_is_one(res)){exit(0);}//They are not relatively prime, Try again.

//Compute the private keyexponenetd, s.t.ed mod phi(n) = 1
BN_mod_inverse(d, e, phi, ctx);
printBN("Private Key:", d);

// Encryption: calculat m^e mod n
BN_hex2bn(&m, "70696e6b2070616e74686572 ");
BN_mod_exp(c, m, e, n, ctx);

printBN("Encryption result:", c);

//Decryption: Calculate c^d mod n

BN_mod_exp(new_m, c, d, n, ctx);

printBN("Decryption result:", new_m);


// Clear the sensitive data rom memory

BN_clear_free(p);BN_clear_free(q);BN_clear_free(n);BN_clear_free(phi);BN_clear_free(e);
BN_clear_free(d);BN_clear_free(m);BN_clear_free(c);BN_clear_free(res);
BN_clear_free(new_m);BN_clear_free(p_minus_one);BN_clear_free(q_minus_one);

return(0);

}