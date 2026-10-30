import { useEffect, useState } from "react";
import "../assets/styles/taxSettings.css";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { fetchTaxSettings, formatSEK, updateTaxSettings } from "../lib/functions";
import { CHURCH_FEE_RATE, estimateTax } from "../lib/tax";

const DEFAULT_TAX_RATE = 30;
const MAX_TAX_RATE = 60;
const EXAMPLE_GROSS = 10000;

export default function TaxSettingsForm() {
  const { token, email } = useAuth();
  const isGuest = email === "guest@ts.com";
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);
  const [churchFee, setChurchFee] = useState(false);
  const [hasSavedRate, setHasSavedRate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchTaxSettings(token)
      .then((settings) => {
        if (settings.taxRate !== null) {
          setTaxRate(settings.taxRate);
          setHasSavedRate(true);
        }
        setChurchFee(settings.churchFee);
      })
      .catch((error) => {
        console.error("Could not load tax settings", error);
        toast.error("Could not load tax settings");
      });
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const data = await updateTaxSettings(token, { taxRate, churchFee });
      if (data.success) {
        setHasSavedRate(true);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Could not save tax settings");
      }
    } catch (error) {
      console.error("Could not save tax settings", error);
      toast.error("Could not save tax settings");
    } finally {
      setSaving(false);
    }
  }

  const example = estimateTax(EXAMPLE_GROSS, { taxRate, churchFee });

  return (
    <form onSubmit={handleSubmit} className="tax-settings-form">
      <div className="tax-rate-group">
        <div className="tax-rate-header">
          <label htmlFor="tax-rate">Tax rate</label>
          <output htmlFor="tax-rate" className="tax-rate-value">
            {taxRate.toLocaleString("sv-SE")}%
          </output>
        </div>
        <input
          type="range"
          id="tax-rate"
          name="tax-rate"
          min={0}
          max={MAX_TAX_RATE}
          step={0.5}
          value={taxRate}
          onChange={(event) => setTaxRate(Number(event.target.value))}
        />
      </div>

      <label className="tax-church-fee" htmlFor="church-fee">
        <input
          type="checkbox"
          id="church-fee"
          name="church-fee"
          checked={churchFee}
          onChange={(event) => setChurchFee(event.target.checked)}
        />
        Church fee (kyrkoavgift, about {CHURCH_FEE_RATE}%)
      </label>

      <p className="tax-hint">
        Use your municipal tax rate (kommunalskatt). If you use the rate from your
        payslip instead, leave the church fee unticked, it's already included.
      </p>

      {example ? (
        <p className="tax-example">
          Of {formatSEK(EXAMPLE_GROSS)} you'd keep about{" "}
          <strong>{formatSEK(example.net)}</strong>
        </p>
      ) : null}

      {!hasSavedRate ? (
        <p className="tax-hint">No rate saved yet, so net earnings are hidden.</p>
      ) : null}

      <button disabled={isGuest || saving} type="submit" className="default-Btn press">
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
