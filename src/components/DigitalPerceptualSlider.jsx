import { useSiteContent } from '../hooks/useSiteContent';

export default function DigitalPerceptualSlider({
  className = '',
  value = 50,
  onChange,
}) {
  const content = useSiteContent();
  const { data, experience } = content.slider;

  return (
    <div
      className={`digital-perceptual-slider ${className}`.trim()}
      aria-label={`${data} to ${experience}`}
    >
      <div className="digital-perceptual-slider__control">
        <span className="digital-perceptual-slider__label">{data}</span>
        <input
          type="range"
          className="digital-perceptual-slider__input"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        />
        <span className="digital-perceptual-slider__label">{experience}</span>
      </div>
    </div>
  );
}
