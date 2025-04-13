import bcrypt

# Función para encriptar una contraseña
def encrypt_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)
    return hashed.decode()

# Función para verificar una contraseña
def check_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

# Prueba del programa
if __name__ == "__main__":
    password = "password123"
    hashed_password = encrypt_password(password)

    print("Contraseña encriptada:", hashed_password)

    # Verificar la contraseña
    is_valid = check_password("password123", hashed_password)
    print("¿La contraseña es válida?:", is_valid)
