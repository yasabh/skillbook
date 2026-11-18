# Certificates and private CAs

Load when the project makes or holds TLS certs, private keys or a private CA.

- A private root CA key MUST be passphrase-encrypted and kept offline; installing a root
  without name constraints in Trusted Root lets its key MITM any site and sign any code.
- Check: `head -1 ca.key` shows `ENCRYPTED`; `openssl x509 -in ca.crt -noout -ext nameConstraints`.
- Service certs MUST be signed by an intermediate CA (`pathlen:0`, name-constrained),
  never the root; the root signs only intermediates, so a leaked intermediate is revoked
  and replaced without touching the root in every client's trust store.
- Check: `openssl x509 -in int.crt -noout -ext basicConstraints` shows `CA:TRUE, pathlen:0`;
  `openssl verify -CAfile ca.crt int.crt` shows `OK`.
- SHOULD show an "install our CA" hint only where it is needed: fetch a second name on the
  same wildcard cert (`mode: "no-cors"`, in CSP `connect-src`); a clicked-through warning
  does not cover another name, so only real trust in the CA lets it load.
