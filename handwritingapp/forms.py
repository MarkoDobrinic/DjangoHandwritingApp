from django import forms
from django.contrib.postgres.forms import SimpleArrayField

class MoveForm(forms.Form):
    moves = SimpleArrayField(forms.CharField(max_length=10000))