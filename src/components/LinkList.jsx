import { assetUrl } from '../utils/assetUrl';
import SparkleText from './SparkleText';

export default function LinkList({ items = [], variant = 'default', emptyMessage }) {
  if (items.length === 0) {
    return <p className="link-list__empty">{emptyMessage}</p>;
  }

  return (
    <ul className={`link-list link-list--${variant}`}>
      {items.map((item) => {
        const isExternal = item.href?.startsWith('http');

        return (
          <li key={item.id} className="link-list__item">
            <a
              className="link-list__link"
              href={item.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              {item.icon && (
                <img className="link-list__icon" src={assetUrl(item.icon)} alt="" />
              )}
              <span className="link-list__copy">
                <SparkleText as="span" className="link-list__label">
                  {item.label}
                </SparkleText>
                {item.detail && <span className="link-list__detail">{item.detail}</span>}
              </span>
              <span className="link-list__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
