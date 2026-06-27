import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminLanguages() {
  return (
    <SimpleCrudPage
      title="Langues"
      endpoint="admin/languages"
      fields={[
        { key: 'title',  label: 'Titre',  type: 'text' },
        { key: 'img',    label: 'Image (URL)', type: 'text', required: false },
        { key: 'status', label: 'Statut', type: 'select-status' },
      ]}
    />
  );
}
