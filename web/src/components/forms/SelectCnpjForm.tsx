"use client";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "../ui/field";

export const SelectCnpjForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione um CNPJ</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <RadioGroup defaultValue="plus" className="max-w-sm">
            <FieldLabel htmlFor="plus-plan">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Plus</FieldTitle>
                  <FieldDescription>
                    For individuals and small teams.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="plus" id="plus-plan" />
              </Field>
            </FieldLabel>
          </RadioGroup>      
        </form>
      </CardContent>
      <CardFooter>
        <Button>Avançar</Button>
      </CardFooter>
    </Card>
  );
}
