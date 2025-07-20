"use client";
import { useState, useRef, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const Select = ({
  options = [],
  value = null,
  onChange = () => {},
  placeholder = "Select an option...",
  label = "",
  error = "",
  searchable = false,
  disabled = false,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
          const searchText = typeof option === "string" ? option : option.label;
          return searchText.toLowerCase().includes(query.toLowerCase());
        });

  const displayValue = (option) => {
    if (!option) return "";
    return typeof option === "string" ? option : option.label;
  };

  const selectedOption = options.find((option) => {
    const optionValue = typeof option === "string" ? option : option.value;
    return optionValue === value;
  });

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}

      <Combobox
        value={selectedOption}
        onChange={(option) => {
          const newValue = typeof option === "string" ? option : option?.value;
          onChange(newValue);
        }}
        disabled={disabled}
      >
        <div className="relative">
          <Combobox.Input
            className={clsx("input pr-10", {
              "input-error": error,
              "opacity-50 cursor-not-allowed": disabled,
            })}
            displayValue={displayValue}
            onChange={(event) => searchable && setQuery(event.target.value)}
            placeholder={placeholder}
            readOnly={!searchable}
          />

          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronUpDownIcon className="h-5 w-5 text-neutral-400" />
          </Combobox.Button>

          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-elevated border border-neutral-200 focus:outline-none">
            {filteredOptions.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-neutral-700">
                No options found.
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue =
                  typeof option === "string" ? option : option.value;
                const optionLabel =
                  typeof option === "string" ? option : option.label;

                return (
                  <Combobox.Option
                    key={index}
                    value={option}
                    className={({ active }) =>
                      clsx(
                        "relative cursor-pointer select-none py-2 pl-10 pr-4",
                        {
                          "bg-primary-100 text-primary-900": active,
                          "text-neutral-900": !active,
                        }
                      )
                    }
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={clsx("block truncate", {
                            "font-medium": selected,
                            "font-normal": !selected,
                          })}
                        >
                          {optionLabel}
                        </span>

                        {selected && (
                          <span
                            className={clsx(
                              "absolute inset-y-0 left-0 flex items-center pl-3",
                              {
                                "text-primary-600": active,
                                "text-primary-600": !active,
                              }
                            )}
                          >
                            <CheckIcon className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                );
              })
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
};

export default Select;
