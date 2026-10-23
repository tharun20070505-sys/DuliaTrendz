import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiSearch,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiCalendar,
  FiCheckCircle,
  FiEye,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomersAdmin = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/admin/customers', {
        params: {
          page,
          limit: 15,
          search: search || undefined,
        },
      });
      setCustomers(res.data.customers || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-champagne/40 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Customer Directory</h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Registered boutique patrons, purchase history, lifetime value, and delivery contacts.
          </p>
        </div>
        <div className="bg-ivory px-4 py-2 rounded-xs border border-champagne/60 text-xs font-semibold text-charcoal">
          Total Patrons: <span className="font-bold text-burgundy">{totalCount}</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xs border border-champagne/30 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patron name, email address, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-champagne/50 rounded-xs focus:outline-hidden focus:border-burgundy"
          />
          <FiSearch className="absolute left-3 top-2.5 text-charcoal/40 w-4 h-4" />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xs border border-champagne/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal min-w-[700px]">
            <thead className="bg-ivory border-b border-champagne/40 text-[10px] uppercase font-bold tracking-wider text-charcoal/70">
              <tr>
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3 text-center">Orders Placed</th>
                <th className="py-3 px-3 text-right">Lifetime Spend</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/20">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal/50">
                    Loading registered boutique patrons...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-charcoal/50">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-burgundy/10 text-burgundy font-serif font-bold flex items-center justify-center text-sm border border-burgundy/20">
                          {c.name ? c.name[0].toUpperCase() : 'P'}
                        </div>
                        <div>
                          <span className="font-semibold text-charcoal block">{c.name}</span>
                          <span className="text-[10px] text-charcoal/50 font-mono">ID: {c._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-charcoal block">{c.email}</span>
                      <span className="text-[10px] text-charcoal/50">{c.phone || 'No phone set'}</span>
                    </td>

                    <td className="py-3 px-3 text-charcoal/60 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-3 text-center font-bold">
                      <span className="bg-ivory px-2.5 py-0.5 rounded-full border border-champagne/50">
                        {c.orderCount || 0}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-burgundy">
                      ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          c.role === 'admin'
                            ? 'bg-burgundy text-white'
                            : 'bg-ivory text-charcoal/70 border border-champagne/50'
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="p-1.5 text-charcoal/60 hover:text-burgundy hover:bg-ivory rounded"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-ivory/50 border-t border-champagne/30 flex items-center justify-between text-xs text-charcoal/60">
          <span>
            Showing {customers.length} of {totalCount} patrons
          </span>
          <div className="flex space-x-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 border border-champagne/50 rounded-xs disabled:opacity-40 hover:bg-white"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-semibold text-charcoal">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 border border-champagne/50 rounded-xs disabled:opacity-40 hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Quick Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xs max-w-md w-full border border-champagne/50 shadow-xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-champagne/30 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal">Patron Profile</h3>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-charcoal/40 hover:text-charcoal text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 pb-2 border-b border-champagne/20">
                <div className="w-12 h-12 rounded-full bg-burgundy text-white font-serif font-bold text-xl flex items-center justify-center">
                  {selectedCustomer.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-charcoal">{selectedCustomer.name}</h4>
                  <span className="text-[11px] text-charcoal/60">{selectedCustomer.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ivory p-3 rounded-xs border border-champagne/40">
                  <span className="text-[10px] uppercase font-bold text-charcoal/60 block">Orders</span>
                  <span className="text-base font-bold text-burgundy">{selectedCustomer.orderCount || 0}</span>
                </div>
                <div className="bg-ivory p-3 rounded-xs border border-champagne/40">
                  <span className="text-[10px] uppercase font-bold text-charcoal/60 block">Lifetime Spend</span>
                  <span className="text-base font-bold text-charcoal">
                    ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-charcoal block mb-0.5">Phone Number:</span>
                <span className="text-charcoal/80">{selectedCustomer.phone || 'Not provided'}</span>
              </div>

              <div>
                <span className="font-semibold text-charcoal block mb-0.5">Registration Date:</span>
                <span className="text-charcoal/80">{new Date(selectedCustomer.createdAt).toLocaleString('en-IN')}</span>
              </div>

              <div>
                <span className="font-semibold text-charcoal block mb-0.5">Role Privileges:</span>
                <span className="font-mono uppercase text-burgundy font-bold">{selectedCustomer.role}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-champagne/30">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-charcoal text-white rounded-xs font-semibold hover:bg-charcoal/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersAdmin;
