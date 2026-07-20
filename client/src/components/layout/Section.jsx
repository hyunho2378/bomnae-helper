// 섹션 · eyebrow(caption 500 대문자 자간+) + title(h2 600) (COMPONENTS A3).
import LangSwap from '../../i18n/LangSwap';
import Container from './Container';

export default function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="py-64 lg:py-80">
      <Container>
        {eyebrow && (
          <LangSwap
            k={eyebrow}
            as="p"
            className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
          />
        )}
        {title && <LangSwap k={title} as="h2" className="mt-8 text-h2 font-semibold" />}
        {children && <div className="mt-24">{children}</div>}
      </Container>
    </section>
  );
}
