import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminPages() {
  return (
    <SimpleCrudPage
      title="Pages"
      endpoint="admin/pages"
      canEdit={true}
      fields={[
        { key: 'title',       label: 'Titre',   type: 'text' },
        { key: 'description', label: 'Contenu', type: 'textarea' },
        { key: 'status',      label: 'Statut',  type: 'select-status' },
      ]}
    />
  );
}
