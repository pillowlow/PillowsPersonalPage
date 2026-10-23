import SparkleText from '../components/SparkleText';
import { useSiteContent } from '../hooks/useSiteContent';
import { assetUrl } from '../utils/assetUrl';

export default function QrCodePage() {
  const content = useSiteContent();
  const page = content.pages.qrcode;

  return (
    <section className="content-page qrcode-page" aria-label={page.title}>
      <div className="content-page__heading">
        <SparkleText as="h1">{page.title}</SparkleText>
      </div>
      <figure className="qrcode-page__figure">
        <img
          className="qrcode-page__image"
          src={assetUrl('/assets/qrcode/pillowlowchen-qr.png')}
          alt={page.alt}
        />
        <figcaption className="qrcode-page__caption">{page.caption}</figcaption>
      </figure>
    </section>
  );
}
