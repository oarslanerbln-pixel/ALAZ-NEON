import Link from 'next/link';

export default function KvkkPage() {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/register" className="px-4 py-2 bg-gray-800 rounded-lg font-bold w-fit">Geri</Link>
      <h1 className="text-2xl font-bold">KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-gray-400">Sürüm: 2026-07-22</p>

      <div className="flex flex-col gap-4 text-gray-200 leading-relaxed">
        <section>
          <h2 className="font-bold text-lg mb-1">1. Veri Sorumlusu</h2>
          <p>MediSade uygulamasını işleten geliştirici, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusudur.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">2. İşlenen Kişisel Veriler</h2>
          <p>E-posta adresiniz, şifrenizin şifrelenmiş (hash&apos;lenmiş) hali, kaydettiğiniz ilaç bilgileri (ad, doz, kullanım zamanı) ve taradığınız sağlık raporlarından çıkarılan metin ile bu metinlerin özetleri işlenmektedir. Rapor metinleri ve ilaç bilgileri KVKK madde 6 uyarınca özel nitelikli kişisel veri (sağlık verisi) sayılır.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">3. İşleme Amacı</h2>
          <p>Verileriniz yalnızca; hesabınızı oluşturmak, ilaç hatırlatıcı listenizi tutmak ve taradığınız raporları anlaşılır bir dile özetlemek amacıyla işlenir. Verileriniz reklam, pazarlama veya profilleme amacıyla kullanılmaz.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">4. Üçüncü Taraflarla Paylaşım</h2>
          <p>Taradığınız rapor metni, yalnızca sadeleştirilmiş bir özet üretmek amacıyla Anthropic (Claude API) adlı yapay zeka servis sağlayıcısına iletilir. Bu sağlayıcı, verilerinizi başka bir amaçla kullanmaz. Verileriniz başka hiçbir üçüncü kişi veya kurumla paylaşılmaz, satılmaz.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">5. Saklama Süresi</h2>
          <p>Verileriniz, hesabınızı silene kadar saklanır. Hesabınızı sildiğinizde tüm verileriniz (ilaçlar, rapor geçmişi dahil) geri döndürülemez şekilde silinir.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">6. Haklarınız (KVKK madde 11)</h2>
          <p>Verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini isteme ve silinmesini isteme haklarına sahipsiniz. Hesap sayfanızdan dilediğiniz zaman hesabınızı ve tüm verilerinizi kalıcı olarak silebilirsiniz.</p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-1">7. Önemli Not</h2>
          <p>MediSade bir tıbbi cihaz veya tanı/tedavi aracı değildir; yalnızca sağlık raporlarınızı sade bir dille özetleyen ve ilaç hatırlatıcı olarak çalışan bir araçtır. Uygulamadaki hiçbir bilgi tıbbi tavsiye yerine geçmez, tüm sağlık kararlarınız için doktorunuza danışmalısınız.</p>
        </section>
      </div>
    </div>
  );
}
