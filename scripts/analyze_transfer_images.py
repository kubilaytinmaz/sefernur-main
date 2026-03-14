"""
Transferler sayfasındaki araç görsellerini analiz etmek için Playwright scripti.
http://localhost:3000/transferler/ sayfasındaki araç kartlarındaki görselleri çıkarır.
"""

from playwright.sync_api import sync_playwright
import json
from datetime import datetime

def analyze_transfer_images():
    """Transferler sayfasındaki araç görsellerini analiz eder."""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("🌐 Sayfa yükleniyor: http://localhost:3000/transferler/")
        page.goto('http://localhost:3000/transferler/')
        
        # Sayfanın tam yüklenmesini bekle
        page.wait_for_load_state('networkidle')
        print("✅ Sayfa yüklendi")
        
        # Ekran görüntüsü al
        screenshot_path = 'transferler_page.png'
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"📸 Ekran görüntüsü alındı: {screenshot_path}")
        
        # Araç kartlarını bul
        # TransferCard bileşeninde img elementlerini ara
        vehicle_images = page.locator('a[href*="/transfer-rezervasyon/"] img').all()
        
        print(f"\n🔍 Bulunan araç görseli sayısı: {len(vehicle_images)}")
        
        vehicles_data = []
        
        for i, img in enumerate(vehicle_images):
            try:
                src = img.get_attribute('src')
                alt = img.get_attribute('alt')
                
                # Parent element'den araç adını al
                parent = img.locator('xpath=../..')
                vehicle_name_elem = parent.locator('h3, .font-semibold').first
                vehicle_name = vehicle_name_elem.text_content() if vehicle_name_elem.count() > 0 else "Bilinmiyor"
                
                # Kapasite bilgisini al
                capacity_elem = parent.locator('text=/\\d+\\s*Kişi/i').first
                capacity = capacity_elem.text_content() if capacity_elem.count() > 0 else ""
                
                # Fiyat bilgisini al
                price_elem = parent.locator('.font-bold, .text-cyan-700').first
                price = price_elem.text_content() if price_elem.count() > 0 else ""
                
                vehicle_info = {
                    'index': i + 1,
                    'vehicle_name': vehicle_name.strip() if vehicle_name else "Bilinmiyor",
                    'image_url': src,
                    'alt_text': alt,
                    'capacity': capacity.strip() if capacity else "",
                    'price': price.strip() if price else ""
                }
                
                vehicles_data.append(vehicle_info)
                
                print(f"\n{'='*60}")
                print(f"Araç {i+1}: {vehicle_info['vehicle_name']}")
                print(f"Kapasite: {vehicle_info['capacity']}")
                print(f"Fiyat: {vehicle_info['price']}")
                print(f"Görsel URL: {src}")
                
            except Exception as e:
                print(f"⚠️ Görsel {i+1} işlenirken hata: {e}")
        
        # Verileri JSON olarak kaydet
        output_file = 'transfer_images_backup.json'
        backup_data = {
            'backup_date': datetime.now().isoformat(),
            'page_url': 'http://localhost:3000/transferler/',
            'total_vehicles': len(vehicles_data),
            'vehicles': vehicles_data
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n{'='*60}")
        print(f"💾 Yedek verisi kaydedildi: {output_file}")
        print(f"📊 Toplam {len(vehicles_data)} araç görseli analiz edildi")
        
        browser.close()
        
        return vehicles_data

if __name__ == "__main__":
    analyze_transfer_images()
