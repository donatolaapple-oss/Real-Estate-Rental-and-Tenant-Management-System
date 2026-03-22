import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllContacts as getTenantContacts } from "../features/tenantUser/tenantUserSlice";
import { getAllContacts as getOwnerContacts } from "../features/ownerUser/ownerUserSlice";
import { ContactsCard, PageLoading, Footer } from "../components";

export default function AllContacts({ userType }) {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const isTenant = userType === "tenant";
  const { contacts, isLoading } = useSelector((s) => (isTenant ? s.tenantUser : s.ownerUser));

  const load = useCallback(() => {
    if (isTenant) {
      dispatch(getTenantContacts({ name: name || undefined }));
    } else {
      dispatch(getOwnerContacts({ name: name || undefined }));
    }
  }, [dispatch, isTenant, name]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading && !contacts) return <PageLoading />;

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 mt-8 mb-12">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        <input
          type="search"
          placeholder="Search by name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 mb-6 w-full max-w-sm"
        />
        <div className="flex flex-wrap gap-4 justify-center">
          {contacts?.length ? (
            contacts.map((c) => (
              <ContactsCard
                key={c._id}
                firstName={c.firstName}
                lastName={c.lastName}
                address={c.address}
                profileImage={c.profileImage}
                email={c.email}
                slug={c.slug}
                tenant={isTenant}
              />
            ))
          ) : (
            <p className="text-slate-600">No contacts yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
