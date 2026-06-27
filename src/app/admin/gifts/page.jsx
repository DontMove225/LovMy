import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminGifts() {
  return (
    <SimpleCrudPage
      title="Cadeaux"
      endpoint="admin/gifts"
      fields={[
        { key: 'img',    label: 'Image (URL)', type: 'text', required: false },
        { key: 'price',  label: 'Prix (coins)', type: 'number' },
        { key: 'status', label: 'Statut', type: 'select-status' },
      ]}
    />
  );
}
