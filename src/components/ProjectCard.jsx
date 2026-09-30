import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { assetUrl } from '../utils/assetUrl';
import {
  getCreditTypeClassName,
  getTypeTagClassName,
} from '../utils/projectTypeColors';
import SparkleText from './SparkleText';

const LEGACY_HIDDEN_TYPE_VALUES = new Set([
  'publication',
  'paper',
  'first-author',
  'first-author-paper',
]);

const DUPLICATE_FORMAT_CREDITS = {
  'full-paper': 'paper',
  competition: 'competition',
  exhibition: 'exhibition',
};

const REFERENCE_LABELS = {
  pdf: 'PDF',
  youtube: 'YouTube',
  web: 'Web',
};

function referenceLabel(kind) {
  return REFERENCE_LABELS[kind] ?? REFERENCE_LABELS.web;
}

export default function ProjectCard({ project }) {
  const { language } = useLanguage();
  const content = useSiteContent();
  const images = project.images ?? [];
  const [imageIndex, setImageIndex] = useState(0);

  const title = language === 'zh' ? project.titleZh : project.titleEn;
  const body = language === 'zh' ? project.contentZh : project.contentEn;
  const creditTypes = project.creditType ?? [];
  const formatTypes = (project.type ?? []).filter((type) => {
    if (LEGACY_HIDDEN_TYPE_VALUES.has(type)) return false;
    const matchingCredit = DUPLICATE_FORMAT_CREDITS[type];
    return !matchingCredit || !creditTypes.includes(matchingCredit);
  });
  const authorship = project.authorship;
  const credit = String(project.credit ?? '').trim();
  const hasProjectTags = creditTypes.length > 0 || formatTypes.length > 0 || authorship;
  const currentImage = images[imageIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const handleImageClick = () => {
    if (!hasMultipleImages) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <article className="project-card">
      <div className="project-card__intro">
        <div className="project-card__head">
          {title && (
            <SparkleText as="h3" className="project-card__title">
              {title}
            </SparkleText>
          )}
          {credit && (
            <div className="project-card__credits">
              <span className="project-card__credit">{credit}</span>
            </div>
          )}
        </div>
        {hasProjectTags && (
          <div className="project-card__types">
            {creditTypes.map((value) => (
              <span
                key={`credit-${value}`}
                className={`project-card__credit-type ${getCreditTypeClassName(value)}`}
              >
                {content.projectTags?.creditTypes?.[value] ?? value}
              </span>
            ))}
            {formatTypes.map((value) => (
              <span
                key={`type-${value}`}
                className={`project-card__type-tag ${getTypeTagClassName(value)}`}
              >
                {content.projectTags?.types?.[value] ?? value}
              </span>
            ))}
            {authorship && (
              <span
                className={`project-card__status project-card__status--${
                  authorship === 'first-author' ? 'firstAuthors' : 'groupArtworks'
                }`}
              >
                {content.projectTags?.authorship?.[authorship] ?? authorship}
              </span>
            )}
          </div>
        )}
      </div>
      {currentImage && (
        <div
          className={`project-card__media${hasMultipleImages ? ' project-card__media--clickable' : ''}`}
          onClick={handleImageClick}
          onKeyDown={(e) => {
            if (!hasMultipleImages) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleImageClick();
            }
          }}
          role={hasMultipleImages ? 'button' : undefined}
          tabIndex={hasMultipleImages ? 0 : undefined}
        >
          <img src={assetUrl(currentImage)} alt="" />
        </div>
      )}
      <div className="project-card__content">
        <SparkleText as="p" className="project-card__body">
          {body}
        </SparkleText>
        {(project.references ?? []).length > 0 && (
          <div className="project-card__refs">
            {project.references.map((ref) => (
              <a
                key={`${ref.kind ?? 'web'}-${ref.link}-${ref.text ?? ''}`}
                className={`project-card__ref-link project-card__ref-link--${ref.kind ?? 'web'}`}
                href={ref.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ref.text || referenceLabel(ref.kind)}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
