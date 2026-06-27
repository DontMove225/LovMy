import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminPlans() {
  return (
    <SimpleCrudPage
      title="Plans d'abonnement"
      endpoint="admin/plans"
      canEdit={true}
      fields={[
        { key: 'title',        label: 'Titre',                type: 'text' },
        { key: 'amt',          label: 'Prix (€)',             type: 'number' },
        { key: 'day_limit',    label: 'Durée (jours)',        type: 'number' },
        { key: 'description',  label: 'Description',          type: 'textarea', required: false },
        { key: 'status',       label: 'Statut',               type: 'select-status' },
      ]}
    />
  );
}
