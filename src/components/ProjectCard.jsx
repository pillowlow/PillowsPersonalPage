import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assetUrl';
import { getTypeTagClassName } from '../utils/projectTypeColors';
import SparkleText from './SparkleText';

export default function ProjectCard({ project }) {
  const { language } = useLanguage();
  const images = project.images ?? [];
  const [imageIndex, setImageIndex] = useState(0);

  const body = language === 'zh' ? project.contentZh : project.contentEn;
  const currentImage = images[imageIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const handleImageClick = () => {
    if (!hasMultipleImages) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <article className="project-card">
      {currentImage && (
        <div
          className="project-card__media"
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
        <div className="project-card__meta">
          <SparkleText as="span" className="project-card__year">
            {String(project.year)}
          </SparkleText>
          <div className="project-card__types">
            {(project.types ?? []).map((type) => (
              <span
                key={type}
                className={`project-card__type-tag ${getTypeTagClassName(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        <SparkleText as="p" className="project-card__body">
          {body}
        </SparkleText>
        {(project.references ?? []).length > 0 && (
          <div className="project-card__refs">
            {project.references.map((ref) => (
              <a
                key={`${ref.link}-${ref.text}`}
                className="project-card__ref-link"
                href={ref.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ref.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
