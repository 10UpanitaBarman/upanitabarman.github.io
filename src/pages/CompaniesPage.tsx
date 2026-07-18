import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageHeader } from '../components/ui/PageHeader'
import { ContactPreviewPanel } from '../components/contacts/ContactPreviewPanel'

export function CompaniesPage() {
  const { companies, contacts, deals } = useApp()
  const [openContactId, setOpenContactId] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Companies" meta={<span>{companies.length} records</span>} />
      <div className="flex-1 overflow-y-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-left text-xs font-semibold text-navy-500">
              <th className="px-6 py-2">Company name</th>
              <th className="px-3 py-2">Industry</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Contacts</th>
              <th className="px-3 py-2">Deals</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const companyContacts = contacts.filter((c) => c.companyId === company.id)
              const companyDeals = deals.filter((d) => d.companyId === company.id)
              return (
                <tr key={company.id} className="border-b border-navy-50 hover:bg-navy-50/60">
                  <td className="px-6 py-2.5 font-semibold text-navy-800">{company.name}</td>
                  <td className="px-3 py-2.5 text-navy-500">{company.industry}</td>
                  <td className="px-3 py-2.5 text-navy-500">
                    {company.city}, {company.country}
                  </td>
                  <td className="px-3 py-2.5">
                    {companyContacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setOpenContactId(c.id)}
                        className="mr-2 text-hsteal-600 hover:underline"
                      >
                        {c.firstName} {c.lastName}
                      </button>
                    ))}
                    {companyContacts.length === 0 && <span className="text-navy-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-navy-700">{companyDeals.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {openContactId && <ContactPreviewPanel contactId={openContactId} onClose={() => setOpenContactId(null)} />}
    </div>
  )
}
