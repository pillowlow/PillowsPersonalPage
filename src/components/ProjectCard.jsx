import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assetUrl';
import { getTypeTagClassName } from '../utils/projectTypeColors';
import SparkleText from './SparkleText';

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
  const images = project.images ?? [];
  const [imageIndex, setImageIndex] = useState(0);

  const title = language === 'zh' ? project.titleZh : project.titleEn;
  const body = language === 'zh' ? project.contentZh : project.contentEn;
  const credits = project.credits ?? [];
  const currentImage = images[imageIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const handleImageClick = () => {
    if (!hasMultipleImages) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const typeTags = (project.types ?? []).filter((type) => type !== 'other');

  return (
    <article className="project-card">
      <div className="project-card__intro">
        <div className="project-card__head">
          {title && (
            <SparkleText as="h3" className="project-card__title">
              {title}
            </SparkleText>
          )}
          {typeTags.length > 0 && (
            <div className="project-card__types">
              {typeTags.map((type) => (
                <span
                  key={type}
                  className={`project-card__type-tag ${getTypeTagClassName(type)}`}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
        {credits.length > 0 && (
          <div className="project-card__credits">
            {credits.map((credit) => (
              <span key={credit} className="project-card__credit">
                {credit}
              </span>
            ))}
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
