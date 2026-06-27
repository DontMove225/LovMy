import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminInterests() {
  return (
    <SimpleCrudPage
      title="Intérêts"
      endpoint="admin/interests"
      fields={[
        { key: 'title',  label: 'Titre',  type: 'text' },
        { key: 'img',    label: 'Image (URL)', type: 'text', required: false },
        { key: 'status', label: 'Statut', type: 'select-status' },
      ]}
    />
  );
}
