// 404 — IA §2.9: unDraw(단색) + "This stop doesn't exist." + Home CTA. EmptyState만 사용.
import Container from '../components/layout/Container';
import EmptyState from '../components/ui/EmptyState';

export default function NotFound() {
  return (
    <Container>
      {/* PLACEHOLDER — unDraw 단색(404) SVG 저장 대기(PROGRESS 준비물) */}
      <EmptyState
        illustration="404.svg"
        titleKey="common.notFound.title"
        bodyKey="common.notFound.body"
        cta={{ labelKey: 'common.notFound.cta', to: '/' }}
      />
    </Container>
  );
}
