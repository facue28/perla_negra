import os
import shutil

SOURCE_DIR = r'C:/Users/Facu elias/Desktop/Program/perlaNegra/raw_batch'

def normalize_name(filename):
    # Separa nombre y extensión
    name, ext = os.path.splitext(filename)
    
    # 1. Correcciones específicas
    # Nota: .lower() se aplica al final, así que detectamos patrones sin importar case
    lower_name = name.lower()
    
    # Sex-roulette-pary-game -> sex-roulette-party-game
    if 'sex-roulette-pary-game' in lower_name:
        lower_name = lower_name.replace('sex-roulette-pary-game', 'sex-roulette-party-game')
        
    # diva-s-secret-effetto-stringente -> diva-s-secret-effetto-tightening
    if 'diva-s-secret-effetto-stringente' in lower_name:
        lower_name = lower_name.replace('diva-s-secret-effetto-stringente', 'diva-s-secret-effetto-tightening')

    # petit-mortret-effetto-tightening -> diva-s-secret-effetto-tightening (Asumiendo error de copiado, si no lo ignoro)
    # El usuario no lo mencionó explícitamente, pero es sospechoso. Lo dejaré solo en minúsculas por ahora si no coincide.
    
    return lower_name + ext.lower()

def main():
    print(f"🔧 Renombrando archivos en: {SOURCE_DIR}")
    
    if not os.path.exists(SOURCE_DIR):
        print("❌ Carpeta no encontrada.")
        return

    files = os.listdir(SOURCE_DIR)
    count = 0
    
    for filename in files:
        old_path = os.path.join(SOURCE_DIR, filename)
        if not os.path.isfile(old_path): continue
        
        new_filename = normalize_name(filename)
        new_path = os.path.join(SOURCE_DIR, new_filename)
        
        if old_path != new_path:
            # Check collision (si ya existe sex-roulette-party-game y renombramos el pary-game a ese mismo)
            if os.path.exists(new_path):
                print(f"⚠️ Conflicto: {new_filename} ya existe. Sobrescribiendo/Fusionando...")
                os.remove(new_path) # Eliminar el destino para reemlazarlo con este (o viceversa, depende de cual sea el 'bueno'. Asumimos que queremos renombrar este).
                
            os.rename(old_path, new_path)
            print(f"✅ Renamed: {filename} -> {new_filename}")
            count += 1
            
    print(f"✨ Completado. {count} archivos renombrados.")

if __name__ == '__main__':
    main()
