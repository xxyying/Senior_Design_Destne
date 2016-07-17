.PHONY: _pwd_prompt decrypt_conf encrypt_conf

CONF_FILE=./settings.json
KEY_FILE=./server

# 'private' task for echoing instructions
_pwd_prompt:
	@echo "Contact mldoughe@ncsu.edu for the password."
	@echo "options are 'decrypt_conf', 'encrypt_conf', or 'generate_key_dev'"

# to create conf/settings.json
decrypt_conf: _pwd_prompt
	openssl cast5-cbc -d -in ${CONF_FILE}.cast5 -out ${CONF_FILE}
	chmod 600 ${CONF_FILE}

# for updating conf/settings.json
encrypt_conf: _pwd_prompt
	openssl cast5-cbc -e -in ${CONF_FILE} -out ${CONF_FILE}.cast5

# for generating key and certificate
generate_key_dev:
	openssl genrsa -des3 -out ${KEY_FILE}.enc.pem 2048
	openssl rsa -in ${KEY_FILE}.enc.pem -out ${KEY_FILE}.pem
	openssl req -new -key ${KEY_FILE}.pem -out ${KEY_FILE}.csr
	openssl x509 -req -days 365 -in ${KEY_FILE}.csr -signkey ${KEY_FILE}.pem -out ${KEY_FILE}.crt
	rm ${KEY_FILE}.csr
