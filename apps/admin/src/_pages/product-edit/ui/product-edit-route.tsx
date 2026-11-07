import { ProductEditView } from './product-edit-page';

export async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditView id={decodeURIComponent(id)} />;
}
