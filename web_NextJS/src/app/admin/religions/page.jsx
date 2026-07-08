import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminReligions() {
  return (
    <SimpleCrudPage
      title="Religions"
      endpoint="admin/religions"
      fields={[
        { key: 'title',  label: 'Titre',  type: 'text' },
        { key: 'status', label: 'Statut', type: 'select-status' },
      ]}
    />
  );
}
