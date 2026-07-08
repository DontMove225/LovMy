import SimpleCrudPage from '../_components/SimpleCrudPage';

export default function AdminFaqs() {
  return (
    <SimpleCrudPage
      title="FAQ"
      endpoint="admin/faqs"
      canEdit={true}
      fields={[
        { key: 'question', label: 'Question', type: 'text' },
        { key: 'answer',   label: 'Réponse',  type: 'textarea' },
        { key: 'status',   label: 'Statut',   type: 'select-status' },
      ]}
    />
  );
}
