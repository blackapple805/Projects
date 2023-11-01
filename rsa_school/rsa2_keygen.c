#include <stdio.h>
#include <stdlib.h>
#include <openssl/bn.h>
#include <openssl/err.h>

#define NBITS 256

void printBN(char *msg, BIGNUM *a)
{
    char *number_str = BN_bn2hex(a);
    if(!number_str) {
        fprintf(stderr, "Error converting number to hex string.\n");
        exit(1);
    }
    printf("%s %s\n", msg, number_str);
    OPENSSL_free(number_str);
}

int main ()
{
    BN_CTX *ctx = BN_CTX_new();
    if(!ctx) {
        fprintf(stderr, "Error creating context.\n");
        exit(1);
    }

    BIGNUM *p = BN_new();
    BIGNUM *q = BN_new();
    BIGNUM *n = BN_new();
    BIGNUM *phi = BN_new();
    BIGNUM *e = BN_new();
    BIGNUM *d = BN_new();
    BIGNUM *m = BN_new();
    BIGNUM *c = BN_new();
    BIGNUM *res = BN_new();
    BIGNUM *new_m = BN_new();
    BIGNUM *p_minus_one = BN_new();
    BIGNUM *q_minus_one = BN_new();

    BN_dec2bn(&e, "65537");

    BN_generate_prime_ex(p, NBITS, 1, NULL, NULL, NULL);
    BN_generate_prime_ex(q, NBITS, 1, NULL, NULL, NULL);
    BN_sub(p_minus_one, p, BN_value_one());
    BN_sub(q_minus_one, q, BN_value_one());
    BN_mul(n, p, q, ctx);
    BN_mul(phi, p_minus_one, q_minus_one, ctx);

    BN_gcd(res, phi, e, ctx);
    if(!BN_is_one(res)) {
        fprintf(stderr, "Error: e and phi(n) are not relatively prime.\n");
        exit(1);
    }

    BN_mod_inverse(d, e, phi, ctx);
    printBN("Private Key:", d);

    BN_hex2bn(&m, "70696e6b2070616e74686572 ");
    BN_mod_exp(c, m, e, n, ctx);
    printBN("Encryption result:", c);

    BN_mod_exp(new_m, c, d, n, ctx);
    printBN("Decryption result:", new_m);

    BN_clear_free(p);
    BN_clear_free(q);
    BN_clear_free(n);
    BN_clear_free(phi);
    BN_clear_free(e);
    BN_clear_free(d);
    BN_clear_free(m);
    BN_clear_free(c);
    BN_clear_free(res);
    BN_clear_free(new_m);
    BN_clear_free(p_minus_one);
    BN_clear_free(q_minus_one);
    BN_CTX_free(ctx);

    return 0;
}
